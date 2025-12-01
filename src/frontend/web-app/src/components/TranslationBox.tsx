import { useState, useEffect, useRef } from 'react';
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

import { backend_translate, backend_feedback } from '../hooks/backend.tsx'

import Context from './Context.tsx';


export default function TranslationBox ({lastTranslation, setLastTranslation, rating, setRating, isTranslated, setTranslated}) {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [toEmoji, setToEmoji] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [addedContext, setContext] = useState("");
    // const [lastTranslation, setLastTranslation] = useState({
    //     text: "",
    //     toEmoji: false
    // });

    const AUTO_TRANSLATE_DELAY = 5000;
    const auto_translate_timer = useRef<number>(null); //consistent timer id

    const activeControllerRef = useRef<AbortController>(null); //so we can abort translate requests that are overridden

    // Trigger translation if non-empty input is left for 5 seconds
    // Also waits for added context to not be edited for 5 seconds
    useEffect(() => {
        auto_translate_timer.current = setTimeout(() => {
            if (inputText.trim() != "") { //TODO: more conditionals than this
                console.log("auto translate triggered");
                handleTranslation(true);
            }
        }, AUTO_TRANSLATE_DELAY);

        return () => {
            if(auto_translate_timer.current) {
                clearTimeout(auto_translate_timer.current);
            }
        };

    }, [inputText, addedContext]);

    // When the output text changes then cancel the timer
    useEffect(() => {
        if(auto_translate_timer.current) {
            clearTimeout(auto_translate_timer.current);
        }
    }, [outputText])

    // Send async translation request to backend and update state
    const handleTranslation = async(autotranslated: boolean) => {
        // If this request is the same as the last translation request, ignore
        if (lastTranslation.text.trim() == inputText.trim() && lastTranslation.toEmoji == toEmoji && (lastTranslation.addedContext.trim() == addedContext.trim() || (autotranslated && addedContext.trim() == ""))){return;}
        else {setLastTranslation({text:inputText, toEmoji:toEmoji, addedContext:addedContext})};
        console.log("translation started");
        setLoading(true);
        setTranslated(false);
        // If there is a current translation request in progress, abort it
        if(activeControllerRef.current){
            activeControllerRef.current.abort();
            console.log("Aborting previous request");
        }
        if(auto_translate_timer.current) {
            clearTimeout(auto_translate_timer.current);
        }
        // Set up new controller to allow abortion of this translation request
        const controller = new AbortController();
        activeControllerRef.current = controller;
        const signal = controller.signal;
        try {
            const translated_output = await backend_translate(toEmoji, inputText, addedContext, signal);
            if(!signal.aborted){
                setOutputText(translated_output);
                setRating(null);
                setTranslated(true);
                activeControllerRef.current = null;
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log("Request was aborted");
            } else {
                // notify user if translation failed
                toast.dismiss();
                toast.error('Translation Failed. Please try again later.');
                console.error(`Translation error: ${err}`);
            }
            activeControllerRef.current = null;
        }
        setLoading(false);
    }

    // Copy text to clipboard and notify user if successful or not
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

    // Adjust current rating and if is new rating, send feedback on backend and notify user if successful or not
    const handleRating = async(val:Boolean) => {
        console.log(`rating ${val} clicked`);
        // If removing rating, then unselect and early return
        if (rating == val){
            setRating(null);
            return;
        }
        setRating(val);
        try {
            await backend_feedback(lastTranslation.text, val, "")
            toast.dismiss();
            toast.success('Feedback sent successfully!');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to send feedback');
            console.error(err);
        }

    }

    // Swap input and output text
    const handleSwap = () => {
        console.log(`Swapping input from ${toEmoji ? 'plain text':'emojis'} to ${toEmoji ? 'emojis':'plain text'}`);
        setToEmoji(!toEmoji);
        let temp = inputText;
        setInputText(outputText);
        setOutputText(temp);
        // Clear rating and translation status
        setRating(null);
        setTranslated(false);
        // If there is a translation in progress, we do not want this to old translation to write to the new output box
        if(activeControllerRef.current){activeControllerRef.current.abort();}
        // if(auto_translate_timer.current) {
        //     clearTimeout(auto_translate_timer.current);
        // }
    }

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
                            <IconButton className="thumb" onClick={()=>handleRating(true)} sx={{visibility: !isTranslated ? 'hidden' : 'visible'}}>{rating==true ? <ThumbUpIcon/> : <ThumbUpOutlinedIcon/>}</IconButton>
                            <IconButton className="thumb" onClick={()=>handleRating(false)} sx={{visibility: !isTranslated ? 'hidden' : 'visible'}}>{rating==false ? <ThumbDownIcon/> : <ThumbDownOutlinedIcon/>}</IconButton>
                            {copyButton(outputText)}
                        </footer>
                    </section>
                </section>
            </fieldset>
            <Context addedContext={addedContext} setContext={setContext} isMobile={isMobile}/>
            <Button className="translate-btn" loading={isLoading} disabled={inputText.trim()==""} onClick={()=>{handleTranslation(false)}}>TRANSLATE</Button>
        </section>
    )
}