import s from './index.module.styl'
import React from 'react'
import { connect } from 'react-redux'
import { load } from '~data/actions/filters'
import { makeTagsAutocomplete } from '~data/selectors/tags'

import Popover from '~co/overlay/popover'
import TagItemView from '~co/tags/item/view'
import SectionView from '~co/tags/section/view'

class TagsMenu extends React.PureComponent {
    static defaultProps = {
        spaceId: undefined, //optional

        inputRef: undefined,
        selected: [],
        downshift: {}
    }

    componentDidMount() {
        this.props.load('global')
        this.loadSpace()
    }

    componentDidUpdate(prev) {
        if (prev.spaceId != this.props.spaceId)
            this.loadSpace()
    }

    loadSpace = ()=>{
        if (parseInt(this.props.spaceId))
            this.props.load(this.props.spaceId)
    }

    keyExtractor = ({_id})=>_id

    render() {
        const {
            tags,
            inputRef,
            downshift: { isOpen, getMenuProps, getItemProps, highlightedIndex }
        } = this.props

        if (!isOpen || !tags.length) return null

        let index = -1

        return (
            <Popover 
                pin={inputRef}
                stretch={true}
                className={s.tags}
                {...getMenuProps({ refKey: 'innerRef' })}>
                {tags.map(item=>{
                    if (!item) return null
            
                    if (item.type == 'section')
                        return (
                            <SectionView 
                                key={item.type+item._id}
                                {...item} />
                        )

                    index++
                    
                    return (
                        <TagItemView
                            {...getItemProps({
                                key: item._id,
                                index,
                                item,
                                ...item,
                                showIcon: false,
                                active: highlightedIndex === index
                            })} />
                    )
                })}
            </Popover>
        )
    }
}

export default connect(
    () => {
        const getTagsAutocomplete = makeTagsAutocomplete()
    
        return (state, { spaceId, selected, downshift: { inputValue } }) => ({
            tags: getTagsAutocomplete(state, spaceId, inputValue, selected)
        })
    },
	{ load }
)(TagsMenu)