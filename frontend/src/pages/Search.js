import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Camera, Mic, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;


const SearchPage = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [imageResults, setImageResults] = useState([]);
  const [listening, setListening] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");


  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  /* Clear image results when typing */
  useEffect(() => {
    if (query.trim()) {
      setImageResults([]);
      setImagePreview(null);
    }
  }, [query]);

  /* 🔍 TEXT SEARCH */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsTextLoading(false);
      return;
    }

    setIsTextLoading(true);
    setLastQuery(query);

    const delay = setTimeout(() => {
      axios
        .get(`${API_URL}/search-suggestions/?q=${query}`)
        .then((res) => setSuggestions(res.data || []))
        .catch(() => setSuggestions([]))
        .finally(() => setIsTextLoading(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  /* 🎤 VOICE SEARCH */
const startVoiceSearch = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice search not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setListening(true);

  recognition.start();

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript || "";

    // 🔧 clean transcript
    transcript = transcript
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

    setQuery(transcript); // triggers search useEffect
    setListening(false);
  };

  recognition.onerror = () => {
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };
};


  /* 🖼 IMAGE SEARCH */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImageLoading(true);
    setImagePreview(URL.createObjectURL(file));
    setImageResults([]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${API_URL}/search/image/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImageResults(res.data.results || []);
    } catch {
      setImageResults([]);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="p-6 w-full h-full space-y-6 overflow-hidden">
      {/* SEARCH BAR */}
      <div className="relative">
        <div className="flex items-center border-b border-black px-5 py-3 bg-white shadow-sm">
          <Search size={18} />
         <input
  className="flex-1 px-3 outline-none"
  placeholder={listening ? "Listening… speak now" : "Search products..."}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>

          <button
  onClick={startVoiceSearch}
  className={`
    transition
    ${listening ? "text-red-500 animate-pulse" : ""}
  `}
>
  <Mic />
</button>

        </div>


        {/* SUGGESTIONS DROPDOWN */}
        {(isTextLoading || suggestions.length > 0) && (
          <div className="absolute w-full mt-2 rounded bg-white shadow z-10 max-h-[60vh] overflow-y-auto">
            {isTextLoading && (
              <div className="p-3 text-sm text-gray-400">
                Searching…
              </div>
            )}

            {!isTextLoading && suggestions.length === 0 && (
              <div className="p-3 text-sm text-gray-400">
                No results found
              </div>
            )}

            {!isTextLoading &&
              suggestions.map((item) => (
               <div
  key={item.id}
  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
  onClick={() => {
    setSuggestions([]);

    if (item.type === "product") {
      navigate(`/product/${item.id}`);
    } else if (item.type === "subcategory") {
      navigate(`/product-list/${item.id}`);
    } else {
      navigate(`/main-categories/${item.id}`);
    }

    onClose?.();
  }}
>
  <span className="text-xs text-gray-400 uppercase w-20">
    {item.type}
  </span>


                  {item.image && (
                    <img
                      src={`http://localhost:8000${item.image}`}
                      alt=""
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}

                  <span className="font-medium truncate">{item.name}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* IMAGE SEARCH */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
        >
          <Camera size={18} /> Image Search
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />

        {imagePreview && (
          <div className="w-14 h-14 border rounded overflow-hidden">
            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {isImageLoading && (
        <p className="text-sm text-gray-400">
          Searching similar products…
        </p>
      )}

      {/* IMAGE RESULTS */}
      {imageResults.length > 0 && (
        <div className="h-[45vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageResults.map((p) => (
              <div
                key={p.id}
                className="border rounded p-2 cursor-pointer"
                onClick={() => {
                  navigate(`/product/${p.id}`);
                  onClose?.();
                }}
              >
                <img
                  src={`http://localhost:8000${p.thumbnail_url}`}
                  alt=""
                  className="w-full h-40 object-cover"
                />
                <p className="font-medium mt-1">{p.name}</p>
                <p className="text-sm text-gray-500">
                  Similarity: {p.similarity_score?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
