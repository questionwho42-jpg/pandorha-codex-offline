<script lang="ts">
import type { CharacterRecord } from "../../../entities/character";
import EspionageManagementPanel from "../ui/EspionageManagementPanel.svelte";

interface Props {
	initialGold?: number;
	characters: readonly CharacterRecord[];
	characterSession: any;
	isTest?: boolean;
}

let {
	initialGold = 1000,
	characters,
	characterSession,
	isTest = false,
}: Props = $props();

let guildGold = $state(initialGold);

function handleUpdateGuildGold(val: number) {
	guildGold = val;
}
</script>

<EspionageManagementPanel
	bind:guildGold={guildGold}
	onUpdateGuildGold={handleUpdateGuildGold}
	characters={characters}
	characterSession={characterSession}
	isTest={isTest}
/>
