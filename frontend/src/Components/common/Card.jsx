function Card({ children, className = "" }) {
  return (
    <div className={`border border-slate-200 rounded-lg p-5 ${className}`}>
      {children}
    </div>
  );
}

export default Card;