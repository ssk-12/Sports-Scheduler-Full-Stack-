export function Button({label, onClick}) {
    return (
        <button 
            onClick={onClick} 
            type="button" 
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 transition duration-150 ease-in-out"
        >
            {label}
        </button>
    );
}
