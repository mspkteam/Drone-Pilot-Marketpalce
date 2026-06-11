import { DashboardNavItem } from "@/components/dashboard/shell/DashboardNavItem";
import type {
  DashboardNavGroup as NavGroup,
  DashboardNavItem as NavItem,
} from "@/types/dashboard-nav";

type DashboardNavGroupProps = {
  group: NavGroup;
  pathname: string;
  homeHref: string;
  onNavigate?: () => void;
};

function isNavItemActive(
  pathname: string,
  item: NavItem,
  homeHref: string,
): boolean {
  const { href, activeExclude } = item;

  if (
    activeExclude?.some(
      (excluded) =>
        pathname === excluded || pathname.startsWith(`${excluded}/`),
    )
  ) {
    return false;
  }

  if (pathname === href) return true;
  if (href === homeHref) return false;
  return pathname.startsWith(`${href}/`);
}

export function DashboardNavGroup({
  group,
  pathname,
  homeHref,
  onNavigate,
}: DashboardNavGroupProps) {
  return (
    <div className="dashboard-nav-group">
      <p className="dashboard-nav-group-label">{group.label}</p>
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={`${group.label}-${item.href}-${item.label}`}>
            <DashboardNavItem
              item={item}
              active={isNavItemActive(pathname, item, homeHref)}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
