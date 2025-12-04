import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CloseIcon from '@mui/icons-material/Close';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EmojiPicker from 'emoji-picker-react';

import { backend_feedback } from '../hooks/backend.tsx';


export default function SuggestionBox ({lastTranslation, rating}) {
    const [suggestionText, setSuggestionText] = useState('');
    const [showPicker, setPicker] = useState(false);

    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Send feedback with suggestion to the backend
    const handleSuggestion = async () => {
        try {
            await backend_feedback(lastTranslation.text, rating, suggestionText)
            toast.dismiss();
            toast.success('Suggestion sent successfully!');
            setSuggestionText("");
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to send suggestion');
            console.error(err);
        }

    }

    // Event Handler to close emoji keyboard when click outside of it when it is open
    const handleClickOutsidePicker = (e) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target)) {
            setPicker(false);
        }
    }

    // When change visibility of emoji keyboard, position picker element and add or remove event listener
    useEffect(() => {
        if (showPicker && emojiButtonRef.current && pickerRef.current) {
            const emojiButtonPos = emojiButtonRef.current.getBoundingClientRect();
            const pickerElement = pickerRef.current;

            pickerElement.style.top = `${emojiButtonPos.bottom}px`;
            pickerElement.style.left = `${emojiButtonPos.left}px`;

            document.addEventListener('click', handleClickOutsidePicker, true);
        }
        else if (!showPicker) {
            document.removeEventListener('click', handleClickOutsidePicker, true);   
        }

    }, [showPicker]);

    // when select emoji add to input
    const handleEmojiClick = (emoji) => {
        setSuggestionText(prevText => prevText + emoji.emoji);
    }   

    return(
        <section className="panel" aria-label="Feedback like placeholder">
          <h2 className="panel-title">Submit a Better Translation Below</h2>
          <div className="panel-body">
            <p>What would be a better translation?</p>
            <textarea className="text-input" value={suggestionText} onChange={(e)=>setSuggestionText(e.target.value)}placeholder="Enter your suggested translation..."></textarea>
            <IconButton ref={emojiButtonRef} className="thumb" onClick={()=>{setPicker(!showPicker)}}>{showPicker==true ? <CloseIcon/> : <EmojiEmotionsIcon/>}</IconButton>
            <Button className="suggestion-btn" onClick={handleSuggestion} disabled={suggestionText.trim()==""}>SUBMIT</Button>
          </div>
          {showPicker && <section ref={pickerRef} className="emoji-container"><EmojiPicker onEmojiClick={handleEmojiClick}/></section>}
        </section>
    )
}