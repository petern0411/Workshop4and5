import React from 'react';
import { getFeedData } from '../server';
import FeedItem from './feeditem';
import StatusUpdateEntry from './statusupdateentry';

export default class Feed extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            contents: []
        };
    }

    render() {
        return (
          < div >
            < StatusUpdateEntry / >
            {this.state.contents.map((feeditem) => {
                    return (
                      < FeedItem key = { feeditem._id } data = { feeditem }/>
                    );
                })}
            < /div>
        )
    }
    componentDidMount(){
      getFeedData(this.props.user, (feedData)=> {
        this.setState(feedData);
      });
    }
}
