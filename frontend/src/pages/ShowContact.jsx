import ShowContactForm from "../components/forms/ShowContactForm";
import { useParams } from "react-router";


export default function ShowContact() {

  const { id } = useParams();


  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <ShowContactForm id={id}/>
      </div>                     
    </div>
  );
}