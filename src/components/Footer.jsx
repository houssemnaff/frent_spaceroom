export const Footer = () => {
    return (
      <footer className="w-full bg-gray-900 px-20 py-16 max-lg:px-10 max-md:px-5 max-md:py-10">
        <div className="px-6 max-md:px-5">
          <div className="flex flex-wrap gap-10 max-md:flex-col max-md:items-center">
            
            {/* Section 1: Description */}
            <div className="w-3/12 max-md:w-full max-md:text-center">
              <div className="pb-8">
                <h3 className="text-xl text-white">EduPlateforme</h3>
                <p className="mt-4 text-base text-gray-400">
                  Une plateforme moderne pour l'apprentissage interactif et collaboratif.
                </p>
              </div>
            </div>
  
            {/* Section 2: Liens rapides */}
            <div className="w-3/12 max-md:w-full max-md:text-center">
              <h4 className="text-white">Liens rapides</h4>
              <ul className="mt-4 text-gray-400 space-y-2">
                <li>FAQ</li>
                <li>Support</li>
                <li>Conditions d'utilisation</li>
                <li>Politique de confidentialité</li>
              </ul>
            </div>
  
            {/* Section 3: Langue & Accessibilité */}
            <div className="w-3/12 max-md:w-full max-md:text-center">
              <h4 className="text-white">Langue & Accessibilité</h4>
              <div className="mt-4 flex items-center gap-4 max-md:justify-center">
                <button className="bg-gray-800 px-6 py-2 text-white rounded-lg">
                  Français
                </button>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/d3c87642acb49a0b8f1c91db122766a231997cfc3725aef90319052a52c7d7cf?placeholderIfAbsent=true"
                  alt="Language"
                  className="h-11 w-11 rounded-lg max-md:w-10"
                />
              </div>
            </div>
  
            {/* Section 4: Réseaux sociaux */}
            <div className="w-3/12 max-md:w-full max-md:text-center">
              <h4 className="text-white">Suivez-nous</h4>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/7bb43dba38b902ca3da3679b1b8c45eb946dc49a492c370adb5b2f6068c4c4aa?placeholderIfAbsent=true"
                alt="Social Media"
                className="mt-4 w-[200px] max-md:w-40"
              />
            </div>
  
          </div>
  
          {/* Footer Bottom Text */}
          <div className="mt-12 pt-6 text-center text-base text-gray-400">
            © 2025 EduPlateforme. Tous droits réservés.
          </div>
        </div>
      </footer>
    );
  };
  