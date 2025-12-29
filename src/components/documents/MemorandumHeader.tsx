import headerImage from '@/assets/memorandum-header.jpg';

export const MemorandumHeader = () => {
  return (
    <div className="mb-4">
      <img 
        src={headerImage} 
        alt="Zaglavlje memoranduma" 
        className="w-full h-auto"
      />
    </div>
  );
};
