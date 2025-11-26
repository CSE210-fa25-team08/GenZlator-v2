import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import TranslationBox from './components/TranslationBox'
import SuggestionBox from './components/SuggestionBox'

import { useState } from 'react';

function App() {
  const [rating, setRating] = useState(null);
  const [isTranslated, setTranslated] = useState(false);
  const [lastTranslation, setLastTranslation] = useState({
        text: "",
        toEmoji: false
    });
  // const [translationState, setTranslationState] = useState<{lastTranslation:string, rating:number|null}|null>(null);

  const feedbackFormUrl =
    import.meta.env.VITE_FEEDBACK_FORM_URL ||
    'https://forms.gle/your-form-id';

  return (
    <div className="layout">
      <Header />
      <main className="content">
        <TranslationBox lastTranslation={lastTranslation} setLastTranslation={setLastTranslation} rating={rating} setRating={setRating} isTranslated={isTranslated} setTranslated={setTranslated}></TranslationBox>
        {rating == false && isTranslated && <SuggestionBox lastTranslation={lastTranslation} rating={rating}/>}
        {/* <TranslationBox translationState={translationState} setTranslationState{setTranslationState}></TranslationBox>
        {translationState && translationState.rating == false && <SuggestionBox translationState={translationState}/>} */}
        <section className="panel" aria-label="Help us improve placeholder">
          <h2 className="panel-title">Help Us Improve</h2>
          <div className="panel-body">
            <p>Share quick thoughts so we can keep improving.</p>
            <a
              className="feedback-link"
              href={feedbackFormUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open Google Form
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
