import React, { useEffect, useState } from "react";

const Meal = () => {
  const [workers, setWorkers] = useState([]);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [nutritionalInfo, setNutritionalInfo] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const CLOUDINARY_UPLOAD_PRESET = "petwell_uploads";
  const CLOUDINARY_CLOUD_NAME = "dq7z2nlgv";

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("https://pet-well.vercel.app/api/worker");
        const data = await response.json();
        setWorkers(data || []);
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };
    fetchWorkers();
  }, []);

  const handleImageUpload = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Image upload error:", error);
      return null;
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const description = `Ingredients: ${ingredients}\nNutritional Info: ${nutritionalInfo}\nPrep time: ${prepTime}`;

    const imageUrl = await handleImageUpload();
    if (!imageUrl) {
      setErrorMessage("Image upload failed. Please try again.");
      setLoading(false);
      return;
    }

    const postDate = new Date().toISOString();

    const newWorker = {
      shopname: "Meal",
      name: "Recipe",
      title,
      description,
      image: imageUrl,
      postDate,
    };

    try {
      const response = await fetch("https://pet-well.vercel.app/api/worker/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorker),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to create post.");
        setLoading(false);
        return;
      }

      setWorkers([...workers, data]);
      setTitle("");
      setIngredients("");
      setNutritionalInfo("");
      setPrepTime("");
      setImageFile(null);
      setImageName("");
    } catch (error) {
      console.error("Error adding worker:", error);
      setErrorMessage("An unexpected error occurred.");
    }

    setLoading(false);
  };

  const handleDeleteWorker = async (workerId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://pet-well.vercel.app/api/worker/${workerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setErrorMessage("Failed to delete post.");
        setLoading(false);
        return;
      }

      setWorkers(workers.filter((worker) => worker._id !== workerId));
    } catch (error) {
      console.error("Error deleting worker:", error);
      setErrorMessage("An unexpected error occurred.");
    }
    setLoading(false);
  };

  const parseDescription = (desc) => {
    const parts = desc.split('\n');
    return {
      ingredients: parts[0]?.replace('Ingredients:', '').trim().split(', ') || [],
      nutritionalInfo: parts[1]?.replace('Nutritional Info:', '').trim().split(', ') || [],
      prepTime: parts[2]?.replace('Prep time:', '').trim() || '',
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 lg:p-12">
      <header className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Pet Meal Recipes</h1>
        <p className="text-lg text-gray-600">
          Share and discover healthy meal recipes for your pets
        </p>
      </header>

      {errorMessage && (
        <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 text-red-700 rounded-lg text-center">
          {errorMessage}
        </div>
      )}

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {workers
          .filter((worker) => worker.shopname === "Meal")
          .map((worker) => {
            const parsed = parseDescription(worker.description);
            return (
              <article
                key={worker._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
              >
                 
                {worker.image && (
                  <figure className="relative h-80">
                    <img
                      src={worker.image}
                      alt={worker.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </figure>
                )}
                
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {worker.title}
                    </h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {worker.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Ingredients:</h4>
                    <ul className="list-disc list-inside pl-2">
                      {parsed.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-gray-600">{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Nutritional Info:</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsed.nutritionalInfo.map((info, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Prep time: {parsed.prepTime}</span>
                      <span>
                        {new Date(worker.postDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div> */}
 <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => handleDeleteWorker(worker._id)}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg text-sm font-semibold transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
         
                
                
                  
                </div>

               
              </article>
              
            );
          })}
      </div>

      {/* Create Meal Form */}
      <section className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <form onSubmit={handleAddWorker} className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Share New Recipe
          </h2>

          <div className="space-y-6">
            {/* Meal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fish Delight"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients (comma-separated)
              </label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Salmon, sweet potato, spinach, fish oil"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Nutritional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nutritional Info (comma-separated)
              </label>
              <input
                type="text"
                value={nutritionalInfo}
                onChange={(e) => setNutritionalInfo(e.target.value)}
                placeholder="Omega-3 rich, grain-free, high protein"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="e.g. 30 minutes"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (optional)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  setImageName(e.target.files[0].name);
                }}
                className="w-full py-2 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">{imageName || "No file selected"}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Meal;
