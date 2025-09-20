'use client'

import React from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/types';


interface TestimonialCarouselProps {
    testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])

    if (!testimonials || testimonials.length === 0) {
        return (
             <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 relative text-center">
                 <p className="text-gray-500">Nenhum depoimento disponível no momento.</p>
             </div>
        )
    }

    return (
        <div className="embla" ref={emblaRef}>
            <div className="embla__container">
                {testimonials.map((testimonial, index) => (
                    <div className="embla__slide" key={index}>
                         <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 relative">
                            <Quote className="absolute top-6 left-6 w-16 h-16 text-brand-gray-100 opacity-75 z-0" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <Image 
                                    src={testimonial.image.url} 
                                    alt={testimonial.name}
                                    width={100} 
                                    height={100} 
                                    className="rounded-full mb-4 border-4 border-white shadow-lg"
                                    loading="lazy"
                                />
                                <h3 className="text-2xl font-semibold mb-2">{testimonial.name}</h3>
                                <p className="text-gray-600 italic leading-relaxed">
                                    “{testimonial.quote}”
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TestimonialCarousel