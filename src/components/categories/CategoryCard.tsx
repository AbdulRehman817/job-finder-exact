import { Link } from "react-router-dom";
import { Category } from "@/types";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link 
      to={`/find-jobs?category=${category.id}`}
      className="category-card group"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl group-hover:bg-primary group-hover:scale-110 transition-all">
        {category.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {category.openPositions} Open position
        </p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
};

export default CategoryCard;
