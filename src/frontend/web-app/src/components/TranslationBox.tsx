import { useState } from 'react';
import toast from 'react-hot-toast';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapVertIcon from '@mui/icons-material/SwapVert';

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function TranslationBox ({rating, setRating}) {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [toEmoji, setToEmoji] = useState(false);
    
    const handleTranslation = async() => {
        console.log(`Translation of ${inputText} ${toEmoji ? 'to emojis': 'to plain text'} triggered`);
        setOutputText(`${inputText} but like as ${toEmoji ? 'emojis':'plain text'}`);
    }

    const handleCopy = async (copiedText:string) => {
        try {
            await navigator.clipboard.writeText(copiedText);
            toast.dismiss();
            toast.success('Copied!');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to copy');
            console.error(err);
        }
    }

    const handleRating = (val:Boolean) => {
        console.log(`rating ${val} clicked`);
        if (rating == val){
            setRating(null);
        }
        else {
            setRating(val);
        }
        toast.dismiss();
        toast.success('Feedback sent successfully!');
    }

    const handleSwap = () => {
        console.log(`Swapping input from ${toEmoji ? 'plain text':'emojis'} to ${toEmoji ? 'emojis':'plain text'}`);
        setToEmoji(!toEmoji);
        let temp = inputText;
        setInputText(outputText);
        setOutputText(temp);
    }

    const emptyOutput = outputText.trim() == "";
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const copyButton = (text:string) => {
        return <Button className="copy-btn" variant="contained" disabled={text.trim()==""} onClick={() => handleCopy(text)} startIcon={<ContentCopyIcon/>}>Copy</Button>
    }

    return(
        <section className="translation-container">
            <fieldset className="boxes-container">
                <section className="translate-box">
                    <header>{toEmoji ? "Plain Text" : "Emoji"}</header>
                    <section id="input-box" className="text-field-box">
                        <textarea 
                            className="text-input"
                            value={inputText}
                            onChange={(e)=>setInputText(e.target.value)}
                            placeholder="Enter emojis or text to translate"
                        />
                        <footer className="text-field-buttons">
                            <label>Character Count: {inputText.trim().length}</label>
                            {copyButton(inputText)}
                        </footer>
                    </section>
                </section>
                <IconButton className="swap-btn" onClick={handleSwap}>{isMobile ? <SwapVertIcon/> : <SwapHorizIcon/>}</IconButton>
                <section className="translate-box">
                    <header>{toEmoji ? "Emoji" : "Plain Text"}</header>
                    <section id="output-box" className="text-field-box">
                        <textarea 
                            className="text-input"
                            value={outputText}
                            readOnly
                            placeholder="Translation will appear here..."
                        />
                        <footer className="text-field-buttons">
                            <IconButton className="thumb" onClick={()=>handleRating(true)} sx={{visibility: emptyOutput ? 'hidden' : 'visible'}}>{rating==true ? <ThumbUpIcon/> : <ThumbUpOutlinedIcon/>}</IconButton>
                            <IconButton className="thumb" onClick={()=>handleRating(false)} sx={{visibility: emptyOutput ? 'hidden' : 'visible'}}>{rating==false ? <ThumbDownIcon/> : <ThumbDownOutlinedIcon/>}</IconButton>
                            {copyButton(outputText)}
                        </footer>
                    </section>
                </section>
            </fieldset>
            <button className="translate-btn" disabled={inputText.trim()==""} onClick={handleTranslation}>TRANSLATE</button>
        </section>
    )
}