import React from 'react'
import Progress from './progress'

export default Component =>
    class PickerSourceDrop extends React.Component {
        static defaultProps = {
            onLink: undefined, //async optional
            onFile: undefined, //async optional
            onCustom: undefined, //async optional (type, data)
            validateCustom: undefined, //func optional (type)
        }

        state = {
            files: [],
            links: [],
            custom: []
        }

        //files
        getFileName = (file)=>
            file.name

        onDropFiles = (files)=>
            this.setState({ files })

        onCancelFiles = ()=>
            this.setState({ files:[] })

        //links
        getLinkName = (link)=>
            link

        onDropLinks = (links)=>
            this.setState({ links })

        onCancelLinks = ()=>
            this.setState({ links:[] })

        //custom
        getCustomName = (custom)=>
            custom[1]

        onDropCustom = (custom)=>
            this.setState({ custom })

        onCancelCustom = ()=>
            this.setState({ custom:[] })

        render() {
            return (
                <>
                    <Component 
                        {...this.props}
                        files={this.state.files}
                        onDropFiles={this.onDropFiles}
                        onDropLinks={this.onDropLinks}
                        onDropCustom={this.onDropCustom} />

                    <Progress
                        items={this.state.files}
                        getName={this.getFileName}
                        process={this.props.onFile}
                        onCancel={this.onCancelFiles} />

                    <Progress
                        items={this.state.links}
                        getName={this.getLinkName}
                        process={this.props.onLink}
                        onCancel={this.onCancelLinks} />

                    <Progress
                        items={this.state.custom}
                        getName={this.getCustomName}
                        process={this.props.onCustom}
                        onCancel={this.onCancelCustom} />
                </>
            )
        }
    }