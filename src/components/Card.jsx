export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-card border border-border rounded-xl
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
};
