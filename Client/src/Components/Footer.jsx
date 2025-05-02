import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-4">
        
        {/* Social Icons Centered */}
        <div className="flex space-x-6">
          <a
            href="https://www.instagram.com/nandiayan_73/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400"
          >
            <FaInstagram className="w-6 h-6" />
          </a>

          <a
            href="https://github.com/nandiayan73"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaGithub className="w-6 h-6" />
          </a>

          <a
            href="https://www.linkedin.com/in/ayan-nandi-0a1746254/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
        </div>

        {/* Footer Text Centered */}
        <div className="text-center">
          <p className="text-sm">
            Created by{" "}
            <a
              href="https://nandiayan.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Ayan Nandi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
