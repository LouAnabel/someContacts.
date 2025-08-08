import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';



// Component for the random contact cloud
const ContactCloud = ({ contacts }) => {
  const [gridItems, setGridItems] = useState([]);
  const navigate = useNavigate()

  // Hover Create Contact Button
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Debug logging
    console.log('ContactCloud - favorite contacts:', contacts);
    
    const gridPlaceholders = [
        { left: 2, top: 1, fontSizeClass: 'text-3xl', fontWeightClass: 'font-light', rotation: 0, },
        { left: 18, top: 10, fontSizeClass: 'text-4xl', rotation: 0 },
        { left: 0, top: 90, fontSizeClass: 'text-3xl', rotation: 270},
        { left: 8, top: 78, fontSizeClass: 'text-2xl', fontWeightClass: 'font-light', rotation: 270 },
        { left: 12, top: 88, fontSizeClass: 'text-4xl', fontWeightClass: 'font-light', rotation: 0 },
        
        { left: 40, top: 28, fontSizeClass: 'text-3xl', fontWeightClass: 'font-light', rotation: 0 },
        { left: 50, top: 36, fontSizeClass: 'text-xl', fontWeightClass: 'font-light', rotation: 0 },
        { left: 60, top: 77, fontSizeClass: 'text-xl', fontWeightClass: 'font-light', rotation: 0 },
        { left: 45, top: 68, fontSizeClass: 'text-2xl', fontWeightClass: 'font-light', rotation: 0 },
        { left: 25, top: 52, fontSizeClass: 'text-3xl', fontWeightClass: 'font-light', rotation: 0 }

        // ab hier nicht sichtbar
        // { left: 70, top: 18, fontSizeClass: 'text-2xl', fontWeightClass: 'font-light' , rotation: 0 },
        // { left: -14, top: 62, fontSizeClass: 'text-2xl', rotation: 270},
        // { right: 0, top: 0, fontSizeClass: 'text-4xl', rotation: 90 },
        // { right: 0, top: 66, fontSizeClass: 'text-xl', fontWeightClass: 'font-light', rotation: 270 }
        
    ];

    // Always process the grid, regardless of contacts
    if (contacts && contacts.length > 0) {
      
      // Shuffle the contacts randomly
      const shuffledContacts = [...contacts].sort(() => Math.random() - 0.5);
      
      // Map shuffled contacts to predifined grid positions
      const filledGrid = gridPlaceholders.map((placeholder, index) => {
        if (index < shuffledContacts.length) {
          const contact = shuffledContacts[index];
          const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
          
          return {
            ...placeholder,
            id: contact.id || index,
            name: name || 'Unknown',
            isVisible: true,
          };
        }
        
        // Return placeholder without contact (won't be rendered)
        return {
          ...placeholder,
          id: `placeholder-${index}`,
          name: '',
          isVisible: false,
        };
      });
      
      setGridItems(filledGrid);

    } else {

      // No contacts - all placeholders are empty
      setGridItems(gridPlaceholders.map((placeholder, index) => ({
        ...placeholder,
        id: `placeholder-${index}`,
        name: '',
        isVisible: false,
      })));
    }
  }, [contacts]);


  if (!contacts || contacts.length === 0) {
    return (
      <div 
        className="bg-white dark:bg-gray-100 border border-red-200 rounded-3xl p-12 mb-8 min-h-[150px] flex flex-col items-center justify-center relative cursor-pointer hover:border-red-300 hover:shadow-sm"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Content that shows/hides on hover */}
        <div className={`flex flex-col items-center justify-center ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
          {/* Star SVG */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1" 
            stroke="currentColor" 
            className={`size-8 mb-3 transition-all duration-200 text-red-500`}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" 
            />
          </svg>
          
          {/* Text that appears on hover */}
          <div className={`font-text font-light text-center tracking-wider text-red-500 text-base ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            here you'll see your favorite contacts.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black rounded-3xl border border-red-200 min-h-[360px] relative overflow-hidden">
      {gridItems
        .filter(item => item.isVisible) // Only render items with contacts
        .map((item) => (
          <Link
            key={item.id}
            to={`/myspace/contacts/${item.id}`}
            className={`absolute font-text select-none pointer-events-auto hover:text-red-500 z-10 hover:z-50 ${item.fontSizeClass} ${item.fontWeightClass} ${Math.abs(item.rotation) === 90 ? 'px-4 py-8' : 'px-2 py-2'}`}
            style={{
              left: item.right !== undefined 
                ? `${100 - Math.max(0, Math.min(20, item.right)) - 5}%`  // Subtract 5% buffer for right positioning
                : `${Math.max(2, Math.min(90, item.left))}%`,
              top: `${Math.max(2, Math.min(85, item.top))}%`,
              transform: `rotate(${item.rotation}deg)`,
              transformOrigin: item.right !== undefined ? 'top right' : 'top left',
              whiteSpace: 'nowrap', 
              overflow: 'hidden'
            }}
          >
            {item.name}
          </Link>
        ))}
        
    </div>
  );
};


export default ContactCloud;