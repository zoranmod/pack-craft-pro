import footerImage from '@/assets/memorandum-footer.jpg';

export const MemorandumFooter = () => {
  return (
    <div 
      className="memorandum-footer"
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <img 
        src={footerImage} 
        alt="Podnožje memoranduma" 
        className="w-full h-auto"
        style={{ maxHeight: '30mm' }}
      />
    </div>
  );
};
