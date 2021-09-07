const MainTitle = ({ title }) => {
  return (
    <div className="bg-blue-600 py-4 w-full mb-2">
      <p className="font-bold text-lg  text-gray-200 flex-grow text-center">
        {title}
      </p>
    </div>
  );
};

export default MainTitle;
