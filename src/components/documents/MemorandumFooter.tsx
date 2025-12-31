import footerImage from '@/assets/memorandum-footer.jpg';

export const MemorandumFooter = () => {
  return (
    <div 
      className="memorandum-footer"
      style={{
        margin: 0,
        padding: 0,
        lineHeight: 0,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <img 
        src={footerImage} 
        alt="Podnožje memoranduma" 
        style={{ 
          display: 'block',
          width: '100%',
          height: 'auto',
          maxHeight: '28mm',
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
};
