import Image from "next/image";
import React from "react";
import Container from "./container";
import { UserIcon, MailIcon, PhoneIcon } from "@heroicons/react/outline";

export default function Faculty({ facultyList }) {
    if (!facultyList || facultyList.length === 0) {
        return null;
    }

    return (
        <Container className="mb-20">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {facultyList.map((faculty) => (
                    <FacultyCard key={faculty.id} faculty={faculty} />
                ))}
            </div>
        </Container>
    );
}

function FacultyCard({ faculty }) {
    const { name, title, photo, email, extension, bio, expertise } = faculty;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            {/* 头像区域 */}
            <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                {photo ? (
                    <Image
                        src={photo}
                        alt={name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-opacity duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <UserIcon className="w-32 h-32 text-indigo-300 dark:text-indigo-600" />
                    </div>
                )}
            </div>

            {/* 信息区域 */}
            <div className="p-6">
                {/* 姓名和职称 */}
                <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                        {name}
                    </h3>
                    <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                        {title}
                    </p>
                </div>

                {/* 联系方式 */}
                {(email || extension) && (
                    <div className="mb-4 space-y-2">
                        {email && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MailIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                <a
                                    href={`mailto:${email}`}
                                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {email}
                                </a>
                            </div>
                        )}
                        {extension && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <PhoneIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                <span>分機: {extension}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 专业领域 */}
                {expertise && expertise.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            專業領域
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {expertise.map((item, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full"
                                >
                                    {item.area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 简介 */}
                {bio && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
