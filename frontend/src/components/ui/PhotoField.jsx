
const PhotoField = ({ photo, setPhoto }) => {
    return (
        <body class="bg-gray-100 p-8">
            <div class="relative">
                {/* <!-- Circular frame with gradient background --> */}
                <div class="w-[323px] h-[323px] rounded-full border border-white/65 flex-shrink-0 relative" style="background: linear-gradient(180deg, rgba(135, 57, 57, 0.20) 68.75%, rgba(255, 17, 17, 0.20) 100%);">
                    
                    {/* <!-- Upload/Photo links positioned in the right middle --> */}
                    <div class="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
                       
                        {/* <!-- Upload link --> */}
                        <a href="#" class="flex w-[189px] h-[43px] justify-center items-center flex-shrink-0 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors">
                            <span class="text-sm font-medium">📁 Upload Image</span>
                        </a>
                        
                        {/* <!-- Take photo link --> */}
                        <a href="#" class="flex w-[189px] h-[43px] justify-center items-center flex-shrink-0 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors">
                            <span class="text-sm font-medium">📷 Take Photo</span>
                        </a>
                        
                    </div>
                </div>
            </div>
        </body>
    );
}

export default PhotoField;
            