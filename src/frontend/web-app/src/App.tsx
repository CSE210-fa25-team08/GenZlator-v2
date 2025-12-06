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

  const feedbackFormUrl =
    import.meta.env.VITE_FEEDBACK_FORM_URL ||
    'https://docs.google.com/forms/d/e/1FAIpQLSfJ0s5Kx6UI-ybN-ilu1q8qRXnHn4S_5yuxcQ_lOXqcjirllQ/viewform?usp=sharing&ouid=117444302010550394548';

  return (
    <div className="layout">
      <Header />
      <main className="content">
        <TranslationBox lastTranslation={lastTranslation} setLastTranslation={setLastTranslation} rating={rating} setRating={setRating} isTranslated={isTranslated} setTranslated={setTranslated}/>
        {/* Only show suggestion box when the output text is the translated text and has been negatively rated */}
        {rating == false && isTranslated && <SuggestionBox lastTranslation={lastTranslation} rating={rating}/>}
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
