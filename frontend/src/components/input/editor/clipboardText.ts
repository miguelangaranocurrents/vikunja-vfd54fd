import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

// Lines of plain text for a block, with list markers kept so copied lists still read as lists.
function blockToLines(node: ProseMirrorNode): string[] {
	if (node.isTextblock) {
		return [node.textContent]
	}

	if (!LIST_TYPES.includes(node.type.name)) {
		const lines: string[] = []
		node.forEach(child => lines.push(...blockToLines(child)))
		return lines
	}

	const lines: string[] = []
	let ordinal = Number(node.attrs.start ?? 1)
	node.forEach(item => {
		let marker = '- '
		if (node.type.name === 'orderedList') {
			marker = `${ordinal++}. `
		} else if (node.type.name === 'taskList') {
			marker = item.attrs.checked ? '- [x] ' : '- [ ] '
		}
		const [first = '', ...rest] = blockToLines(item)
		lines.push(marker + first, ...rest.map(line => ' '.repeat(marker.length) + line))
	})
	return lines
}

export function serializeFragmentAsText(content: Fragment): string {
	const lines: string[] = []
	content.forEach(node => lines.push(...blockToLines(node)))
	return lines.join('\n')
}
