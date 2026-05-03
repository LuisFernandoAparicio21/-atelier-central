import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  bgIcon: LucideIcon;
  colorClass: string;
  bgColorClass: string;
  iconBgClass: string;
  delay?: number;
  onClick?: () => void;
}

export default function ActionCard({ 
  title, 
  icon: Icon, 
  bgIcon: BgIcon, 
  colorClass, 
  bgColorClass, 
  iconBgClass,
  delay = 0,
  onClick
}: ActionCardProps) {
  return (
    <motion.button 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={`group flex flex-col items-start p-6 ${bgColorClass} rounded-xl text-left hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden shadow-sm cursor-pointer`}
    >
      <div className={`${iconBgClass} p-3 rounded-full mb-8 shadow-sm`}>
        <Icon size={28} className={colorClass} />
      </div>
      
      <span className={`${colorClass} font-bold text-xl leading-tight font-headline`} dangerouslySetInnerHTML={{ __html: title }} />
      
      <BgIcon 
        size={80} 
        className={`absolute bottom-4 right-4 ${colorClass} opacity-10 transition-transform group-hover:scale-125 duration-500`} 
      />
    </motion.button>
  );
}
