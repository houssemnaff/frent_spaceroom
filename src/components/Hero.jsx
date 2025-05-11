import { Link } from "react-router-dom";

export const Hero = () => {
    return (
      <section className="w-full px-20 pt-6 max-lg:px-10 max-md:px-5 bg-gradient-to-br from-blue-100 to-white dark:from-blue-950/20 dark:to-gray-950">
        <div className="mx-auto max-w-[1306px] gap-5 flex items-center max-md:flex-col-reverse">
          {/* Image Section */}
          <div className="w-6/12 max-md:w-full px-[50px] pt-[25px] pb-[75px] max-md:px-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/222eecf589b29ffbec876a90218840cc780883b4708563dad0466265b9ba58f4?placeholderIfAbsent=true"
              alt="Platform Preview"
              className="w-full rounded-2xl shadow-lg"
            />
          </div>
  
          {/* Text Section */}
          <div className="w-6/12 max-md:w-full">
            <div className="flex flex-col py-0.5 pr-12 max-md:pr-0 max-md:text-center">
              <h1 className="text-6xl leading-[60px] text-black max-lg:text-5xl max-md:text-[40px] max-md:leading-[44px]">
                Apprenez, Collaborez, Réussissez
              </h1>
              <p className="mt-8 text-xl text-gray-600 max-md:mt-5">
                Une plateforme moderne pour l'apprentissage interactif et collaboratif.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 max-md:justify-center">
                <Link to="login">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full">
                  S'inscrire gratuitement
                </button>
                </Link>
                <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full">
                  Découvrir la plateforme
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  