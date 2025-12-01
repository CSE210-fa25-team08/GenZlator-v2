export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" role="contentinfo">
      <div>© {year} GenZlator-v2</div>
      <div className="footer-actions">
        <button className="footer-btn" type="button">Privacy Policy</button>
        <button className="footer-btn" type="button">Terms of Service</button>
        <button className="footer-btn" type="button">About</button>
      </div>
    </footer>
  )
}