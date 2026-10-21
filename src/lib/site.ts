import site from '../content/site.json';
export { site };
export const tel = `tel:${site.phoneE164}`;
export const mailto = (subject?: string) =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export type NavItem = { label: string; href: string; external?: boolean; primary?: boolean; utility?: boolean; children?: { label: string; href: string }[] };

// Same order and hierarchy as the original Wix nav (build script 7.1).
export const nav: NavItem[] = [
  { label: 'About Us', href: '/' },
  { label: 'Enroll', href: site.iclassproClasses, external: true, primary: true },
  { label: 'Class Schedule', href: '/class-schedule', children: [{ label: 'Tuition & Policies', href: '/tuition-and-policies' }] },
  { label: 'Classes Offered', href: '/classes-offered', children: [{ label: 'Team Gymnastics', href: '/team-gymnastics' }] },
  { label: 'Events', href: '/events', children: [
    { label: 'Nerf Battle', href: '/nerf-battle' },
    { label: 'Birthday Parties', href: '/birthday-parties' },
    { label: "Parent's Night Out", href: '/parents-night-out' },
    { label: 'Participation Waiver', href: '/participation-waiver' },
    { label: 'Calendar', href: '/calendar' },
  ] },
  { label: 'Photos', href: '/photos' },
  { label: 'Contact', href: '/contact' },
  { label: 'Create an Account', href: site.iclassproRegister, external: true, utility: true },
  { label: 'Member Login', href: site.iclassproPortal, external: true, utility: true },
];

export function isCurrent(itemHref: string, path: string) {
  const p = path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  return itemHref === p;
}
export function isSection(item: NavItem, path: string) {
  return isCurrent(item.href, path) || !!item.children?.some((c) => isCurrent(c.href, path));
}
