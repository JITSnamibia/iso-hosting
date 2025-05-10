// src/components/UI.jsx
export const Button = ({ variant = "primary", children, onClick, className = "", ...props }) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-colors";
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white",
      outline: "border border-gray-600 hover:bg-gray-800 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    };
  
    return (
      <button 
        onClick={onClick} 
        className={`${base} ${variants[variant]} ${className}`} 
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export const Input = ({ label, ...props }) => (
    <div>
      {label && <label className="block text-sm text-gray-400 mb-1">{label}</label>}
      <input className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
    </div>
  );