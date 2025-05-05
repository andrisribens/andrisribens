export default function loader() {
  return (
    <div className="loader">
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <circle
          className="loader__spin2"
          cx="400"
          cy="400"
          fill="none"
          r="100"
          strokeWidth="40"
          stroke="#ffd687"
          strokeDasharray="383 1400"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
