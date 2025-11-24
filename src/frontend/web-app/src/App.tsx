import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const feedbackFormUrl =
    import.meta.env.VITE_FEEDBACK_FORM_URL ||
    'https://forms.gle/your-form-id';

  return (
    <div className="layout">
      <Header />
      <main className="content">
        <section className="panel" aria-label="Translation layout placeholder">
          <h2 className="panel-title">Translation</h2>
          <div className="panel-body"></div>
        </section>
        <section className="panel" aria-label="Feedback like placeholder">
          <h2 className="panel-title">Do you like this translation?</h2>
          <div className="panel-body"></div>
        </section>
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
