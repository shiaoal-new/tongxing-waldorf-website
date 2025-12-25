import Image from "next/image";
import React from "react";
import Container from "./container";
import { UserIcon, MailIcon, PhoneIcon } from "@heroicons/react/outline";

export default function Faculty({ facultyList }) {
    if (!facultyList || facultyList.length === 0) {
        return null;
    }

    return (
        <Container className="mb-section">
            <div className="grid spacing-component md:grid-cols-2 lg:grid-cols-3">
                {facultyList.map((faculty) => (
                    <FacultyCard key={faculty.id} faculty={faculty} />
                ))}
            </div>
        </Container>
    );
}

function FacultyCard({ faculty }) {
    const { name, title, photo, email, extension, bio, expertise, education, experience } = faculty;

    return (
        <div className="bg-brand-bg dark:bg-brand-structural rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            {/* 头像区域 */}
            <div className="relative h-64 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900">
                {(faculty.media?.image || photo) ? (
                    <Image
                        src={faculty.media?.image || photo}
                        alt={name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-opacity duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <UserIcon className="w-32 h-32 text-brand-accent/60 dark:text-brand-accent" />
                    </div>
                )}
            </div>

            {/* 信息区域 */}
            <div className="p-6">
                {/* 姓名和职称 */}
                <div className="mb-4">
                    <h3 className="font-bold text-brand-text dark:text-brand-bg mb-1">
                        {name}
                    </h3>
                    <p className="text-lg text-brand-accent dark:text-brand-accent font-medium">
                        {title}
                    </p>
                </div>

                {/* 联系方式 */}
                {(email || extension) && (
                    <div className="mb-4 space-y-2">
                        {email && (
                            <div className="flex items-center text-brand-taupe dark:text-brand-taupe">
                                <MailIcon className="w-5 h-5 mr-2 text-brand-accent" />
                                <a
                                    href={`mailto:${email}`}
                                    className="hover:text-brand-accent dark:hover:text-brand-accent transition-colors"
                                >
                                    {email}
                                </a>
                            </div>
                        )}
                        {extension && (
                            <div className="flex items-center text-brand-taupe dark:text-brand-taupe">
                                <PhoneIcon className="w-5 h-5 mr-2 text-brand-accent" />
                                <span>分機: {extension}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 专业领域 */}
                {expertise && expertise.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-brand-text dark:text-brand-taupe mb-2">
                            專業領域
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {expertise.map((item, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-brand-accent dark:text-brand-accent/60 rounded-full"
                                >
                                    {item.area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 學歷與經歷 */}
                {(education || experience) && (
                    <div className="mb-4 space-y-3">
                        {education && (
                            <div>
                                <h4 className="text-xs font-bold text-brand-taupe uppercase tracking-wider mb-1">
                                    學歷背景
                                </h4>
                                <p className="text-sm text-brand-text dark:text-brand-taupe">
                                    {education}
                                </p>
                            </div>
                        )}
                        {experience && (
                            <div>
                                <h4 className="text-xs font-bold text-brand-taupe uppercase tracking-wider mb-1">
                                    專業背景/經歷
                                </h4>
                                <p className="text-sm text-brand-text dark:text-brand-taupe">
                                    {experience}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* 简介 */}
                {bio && (
                    <div className="mt-4 pt-4 border-t border-brand-taupe/20 dark:border-brand-structural">
                        <h4 className="text-xs font-bold text-brand-taupe uppercase tracking-wider mb-1">
                            個人簡介
                        </h4>
                        <div className="text-brand-taupe dark:text-brand-taupe text-sm prose prose-sm dark:prose-invert max-w-none">
                            {bio}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
