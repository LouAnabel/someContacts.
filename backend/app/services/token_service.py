from flask_jwt_extended import decode_token
from flask import current_app
from datetime import datetime, timezone
from app.models.token_block_list import TokenBlockList
from app import db
from sqlalchemy.exc import NoResultFound


def add_token_to_database(encoded_token):
    decoded_token = decode_token(encoded_token)
    jti = decoded_token["jti"]
    token_type = decoded_token["type"]
    identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]

    user_id = decoded_token.get(identity_claim)
    expires = datetime.fromtimestamp(decoded_token["exp"])

    db_token = TokenBlockList(
        jti=jti,
        token_type=token_type,
        user_id=user_id,
        expires=expires
    )
    db.session.add(db_token)
    db.session.commit()


def revoke_token(token_jti, user_id):
    try:
        token = TokenBlockList.query.filter_by(jti=token_jti, user_id=user_id).one()
        token.revoked_at = datetime.now(timezone.utc)
        db.session.commit()

    except NoResultFound:
        raise Exception(f"Could not find token {token_jti}")


def is_token_revoked(jwt_payload):
    jti = jwt_payload["jti"]
    user_id = jwt_payload[current_app.config["JWT_IDENTITY_CLAIM"]]
    try:
        token = TokenBlockList.query.filter_by(jti=jti, user_id=user_id).one()
        return token.revoked_at is not None

    except NoResultFound:
        raise Exception(f"Could not find token {jti}")