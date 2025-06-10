interface IProps {
    image: string;
    title: string;
    description: string;
}

const NewsCard  = (props: IProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <img src={props.image} alt={props.title} className="w-full h-50 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{props.title}</h3>
        <p className="text-sm text-gray-600">{props.description}</p>
      </div>
    </div>
  );
};

export default NewsCard;
