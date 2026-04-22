import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DOCS_SITES, getDocsSiteHrefFromPathname } from "@/lib/docs-sites";

type Props = {
	currentPathname: string;
	currentSiteId: string;
};

function DocsSiteSwitcher({ currentPathname, currentSiteId }: Props) {
	return (
		<Select
			value={currentSiteId}
			onValueChange={(nextSiteId) => {
				window.location.assign(
					getDocsSiteHrefFromPathname(currentPathname, nextSiteId),
				);
			}}
		>
			<SelectTrigger
				className="h-9 w-44 border-border/65 bg-muted/30 px-3 text-sm font-medium text-foreground/85 shadow-none hover:bg-accent/70"
				aria-label="Switch docs site"
			>
				<SelectValue placeholder="Switch docs site" />
			</SelectTrigger>
			<SelectContent>
				{DOCS_SITES.map((site) => (
					<SelectItem key={site.id} value={site.id}>
						{site.displayName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default DocsSiteSwitcher;
