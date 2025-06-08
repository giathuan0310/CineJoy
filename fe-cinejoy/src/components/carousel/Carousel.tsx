import { Carousel } from 'antd';
import React, { useState } from "react";

const images: string[] = [
    "https://res.cloudinary.com/dd1vwmybp/image/upload/v1749292828/7._f5vk1i.jpg",
    "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969912/7ca50-civil_war_brr2j2.webp",
    "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969914/Te%CC%80o_Em_xoqbn9.webp",

];

const Slider: React.FC = () => {
    const [loading] = useState(false);

    return (
        <div className="flex justify-center w-full pt-3">
            <div className=" mx-auto w-[40%]   ">
                <Carousel autoplay>
                    {loading ? (
                        <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                            <span className="text-gray-500">Loading...</span>
                        </div>
                    ) : (
                        images.map((img, idx) => (
                            <div
                                key={idx}
                                className="w-full h-64 flex items-center justify-center"
                            >
                                <img
                                    src={img}
                                    alt={`Banner ${idx + 1}`}
                                    className="w-full h-64 object-cover rounded"
                                />
                            </div>
                        ))
                    )}
                </Carousel>
            </div>
        </div>
    );
};

export default Slider;