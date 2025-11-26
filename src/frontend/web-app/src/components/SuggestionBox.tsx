import { useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@mui/material/Button';

import { backend_feedback } from '../hooks/backend.tsx';


export default function SuggestionBox ({lastTranslation, rating}) {
    const [suggestionText, setSuggestionText] = useState('');

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

    return(
        <section className="panel" aria-label="Feedback like placeholder">
          <h2 className="panel-title">Submit a Better Translation Below</h2>
          <div className="panel-body">
            <p>What would be a better translation?</p>
            <textarea className="text-input" value={suggestionText} onChange={(e)=>setSuggestionText(e.target.value)}placeholder="Enter your suggested translation..."></textarea>
            <Button className="suggestion-btn" onClick={handleSuggestion} disabled={suggestionText.trim()==""}>SUBMIT</Button>
          </div>
        </section>
    )
}