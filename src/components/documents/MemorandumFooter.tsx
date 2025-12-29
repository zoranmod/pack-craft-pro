import footerImage from '@/assets/memorandum-footer.jpg';

export const MemorandumFooter = () => {
  return (
    <div className="mt-auto pt-8">
      <img 
        src={footerImage} 
        alt="Podnožje memoranduma" 
        className="w-full h-auto"
      />
    </div>
  );
};
