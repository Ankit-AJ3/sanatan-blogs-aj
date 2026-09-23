// Central icon set. The site uses line icons everywhere instead of emoji,
// so swapping an icon only means changing it here.
import { createElement } from "react";
import type { IconType } from "react-icons";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBold,
  LuCheck,
  LuEye,
  LuFileText,
  LuFlame,
  LuFlower2,
  LuGlobe,
  LuHeading2,
  LuHeading3,
  LuHeart,
  LuImage,
  LuImagePlus,
  LuInfinity,
  LuInfo,
  LuItalic,
  LuLandmark,
  LuLayoutDashboard,
  LuLink,
  LuList,
  LuListOrdered,
  LuLock,
  LuMenu,
  LuMessageCircle,
  LuMoon,
  LuPersonStanding,
  LuQuote,
  LuSave,
  LuScrollText,
  LuSearch,
  LuSend,
  LuShell,
  LuSquarePen,
  LuStar,
  LuSun,
  LuSwords,
  LuTrash2,
  LuTrendingUp,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { SiFacebook, SiTelegram, SiWhatsapp, SiX } from "react-icons/si";

export type { IconType };

// Actions & meta
export const LikeIcon = LuHeart;
export const CommentIcon = LuMessageCircle;
export const ShareIcon = LuLink;
export const SearchIcon = LuSearch;
export const GlobeIcon = LuGlobe;
export const InfoIcon = LuInfo;
export const LockIcon = LuLock;
export const TrashIcon = LuTrash2;
export const CheckIcon = LuCheck;
export const ArrowRightIcon = LuArrowRight;
export const ArrowLeftIcon = LuArrowLeft;
export const MenuIcon = LuMenu;
export const CloseIcon = LuX;
export const SunIcon = LuSun;
export const MoonIcon = LuMoon;
export const StarIcon = LuStar;
export const PopularIcon = LuTrendingUp;
export const LampIcon = LuFlame;

// Admin & editor
export const DashboardIcon = LuLayoutDashboard;
export const WriteIcon = LuSquarePen;
export const PostsIcon = LuFileText;
export const UsersIcon = LuUsers;
export const PreviewIcon = LuEye;
export const SaveIcon = LuSave;
export const PublishIcon = LuSend;
export const ImageIcon = LuImage;
export const ImageUploadIcon = LuImagePlus;
export const Heading2Icon = LuHeading2;
export const Heading3Icon = LuHeading3;
export const BoldIcon = LuBold;
export const ItalicIcon = LuItalic;
export const QuoteIcon = LuQuote;
export const ListIcon = LuList;
export const OrderedListIcon = LuListOrdered;
export const LinkIcon = LuLink;

// Share targets
export const shareIcons = { whatsapp: SiWhatsapp, facebook: SiFacebook, x: SiX, telegram: SiTelegram };

const categoryIcons: Record<string, IconType> = {
  "bhagavad-gita": LuFlower2,
  "vedas-upanishads": LuScrollText,
  "ramayana-mahabharata": LuSwords,
  puranas: LuShell,
  festivals: LuFlame,
  "temples-tirth": LuLandmark,
  "yoga-dhyan": LuPersonStanding,
  sanskriti: LuInfinity,
};

/** Icon for a category slug, falling back to the lotus. */
export function CategoryIcon({ slug, className = "size-5" }: { slug: string; className?: string }) {
  return createElement(categoryIcons[slug] ?? LuFlower2, { className, "aria-hidden": true });
}
