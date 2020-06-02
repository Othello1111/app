import React from 'react'
import t from '~t'
import Blank from './blank'
import ViewWithDrop from './viewWithDrop'
import Rename from './rename'
import Contextmenu from './contextmenu'
import Sharing from '../sharing'
import ChangeIcon from '../changeIcon'

export default class CollectionsItem extends React.Component {
    static defaultProps = {
        item:       {},
        active:     false,
        events:     {}, //same as ...items/index
        actions:    {} //redux collections
    }

    state = {
        rename: false,
        menu: false,
        sharing: false
    }

    handlers = {
        onClick: (e)=>{
            const { item, multiselect, events, actions } = this.props

            //create new
            if (item._id == -100){
                e.preventDefault()
                return actions.oneCreate({ title: item.title }, events.onItemClick)
            }

            //select
            if (item._id > 0)
                if (multiselect || e.metaKey || e.ctrlKey || e.shiftKey){
                    e.preventDefault()
                    return this.handlers.onSelectClick()
                }

            //click on item
            if (events.onItemClick){
                if (events.onItemClick(item)!='continue')
                    e.preventDefault()
                else
                    return
            }

            //otherwise usual click on href
        },

        onSelectClick: ()=>{
            const { active, multiselect, actions: { selectOne, unselectOne } } = this.props

            if (active && multiselect)
                unselectOne(this.props.item._id)
            else
                selectOne(this.props.item._id)
        },
    
        onExpandClick: ()=>
            this.props.actions.oneToggle(this.props.item._id),
    
        onRenameClick: ()=>{
            if (!this.props.multiselect)
                this.setState({ rename: true })
        },
        
        onRenameCancel: ()=>
            this.setState({ rename: false }),

        onIconClick: ()=>
            this.setState({ icon: true }),

        onIconClose: ()=>
            this.setState({ icon: false }),
    
        onRemoveClick: ()=>{
            if (confirm(t.s('areYouSure')))
                this.props.actions.oneRemove(this.props.item._id)
        },
    
        onContextMenu: (e)=>{
            e.preventDefault()
            e.target.focus()
            
            if (!this.props.multiselect)
                this.setState({ menu: true })
        },
    
        onContextMenuClose: ()=>
            this.setState({ menu: false }),

        onSharing: ()=>
            this.setState({ sharing: true }),
    
        onSharingClose: ()=>
            this.setState({ sharing: false }),

        onCreateNewChildClick: ()=>{
            this.props.actions.addBlank(this.props.item._id, true)
        },
    
        onKeyUp: (e)=>{
            switch(e.keyCode){
                case 37: //left
                case 39: //right
                    e.preventDefault()
                    return this.handlers.onExpandClick()
    
                case 46: //delete
                case 8: //backspace
                    e.preventDefault()
                    return this.handlers.onRemoveClick()
    
                case 13: //enter
                    e.preventDefault()
                    return this.handlers.onRenameClick()
            }
        }
    }

    render() {
        const { item, uriPrefix, ...props } = this.props

        const Component = item._id == -101 ?
            Blank :
            (this.state.rename ? Rename : ViewWithDrop)

        return (
            <>
                <Component 
                    {...item}
                    {...props}
                    {...this.handlers}
                    to={`${uriPrefix}${item._id}`} />

                {this.state.menu ? (
                    <Contextmenu 
                        {...item}
                        {...props}
                        {...this.handlers}
                        to={`${uriPrefix}${item._id}`} />
                ) : null}

                {this.state.sharing ? (
                    <Sharing 
                        _id={item._id}
                        onClose={this.handlers.onSharingClose} />
                ) : null}

                {this.state.icon ? (
                    <ChangeIcon
                        _id={item._id}
                        onClose={this.handlers.onIconClose} />
                ) : null}
            </>
        )
    }
}