import { getCategories, deleteCategory} from "../apiCalls/contactsApi";
import { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router";
import CircleButton from "../components/ui/Buttons";


export default function ShowCategories() {

    const navigate = useNavigate();
    const { accessToken } = useAuthContext();

    // Contact states
    const [contacts, setContacts] = useState([]);
    const [allContacts, setAllContacts] = useState([]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        Peter
      </div>                     
    </div>
  );
}