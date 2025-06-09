interface UserComment {
    name: string;
    avatar: string;
    date: string;
    comment: string;
    nameColor?: string;
}

interface IProps {
    image: string;
    title: string;
    rating: number;
    comments: number;
    users: UserComment[];
}

const CommentCard = (props: IProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative">
        <img src={props.image} alt={props.title} className="w-full h-48 object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-sm px-3 py-1 flex justify-between items-center">
          <span className="font-semibold">{props.title}</span>
          <span>⭐ {props.rating} 💬 {props.comments}</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {props.users.map((user, index) => (
          <div key={index} className="flex space-x-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
            <div>
              <p className={`font-semibold ${user.nameColor ?? ""}`}>{user.name}</p>
              <p className="text-sm text-gray-500">{user.date}</p>
              <p>{user.comment}</p>
            </div>
          </div>
        ))}
        <a href="#" className="text-red-500 text-sm inline-block">Xem thêm →</a>
      </div>
    </div>
  );
};

export default CommentCard;
