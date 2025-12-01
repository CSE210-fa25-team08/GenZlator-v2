import { useState, useEffect, useRef } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';

import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';


export default function Context ({addedContext, setContext, isMobile}) {
    const [displayState, setDisplay] = useState(false);
    //TODO: if is mobile then will need to give more info in a different way than tooltip

    if (displayState) {
        return (
            <fieldset className="context-container">
                <IconButton className="exit" onClick={() => {setDisplay(false); setContext("");}}><CloseIcon/></IconButton>
                <header>Additional Context</header>
                <label>Add earlier messages in this conversation for better assessment of tone and context.</label>
                <label>Separate messages using the 'Enter' or 'Return' keys.</label>
                <textarea className="text-input" value={addedContext} onChange={(e)=>setContext(e.target.value)} placeholder="Enter earlier messages and context here..."/> 
            </fieldset>
        )
    }
    else {
        return(
            <Tooltip title="Add earlier messages in this conversation for better assessment of tone and context.">
                <Button className="add-context-btn" onClick={() => setDisplay(true)} startIcon={<AddCircleIcon/>}>Add Context</Button>
            </Tooltip>
        )
    }
}