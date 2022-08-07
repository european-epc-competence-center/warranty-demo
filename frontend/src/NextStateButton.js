import Button from 'react-bootstrap/Button'
import axios from 'axios'
import { BACKEND_URL, STORY_LINE } from './Config'

const NextStateButton = props => {
  function setDemoStateAtBackend() {
    var next_state = ""
    if (typeof props.nextState !== 'undefined') {
      var next_state = props.nextState
    } else if (typeof props.currentState !== 'undefined') {
      let current_state_index = STORY_LINE.indexOf(props.currentState)
      let next_state_index = (current_state_index + 1) % STORY_LINE.length
      var nextState = STORY_LINE[next_state_index]
      console.log("nextState: " + nextState)
    } else {
      console.log("Error in NextButton call: Neither nextState nor currenState given")
    }

    var params = { nextState: nextState, demo_user_id: props.demoUserID }
    if (props.force === true) {
      params.force = true
    }

    axios.post(BACKEND_URL + '/api/setDemoState', null, {
      params: params
    }).then(function (response) {
      console.log(response)
    }).catch(function (error) {
      console.log("Error in NextButton call: " + error)
    })
  }

  return (
    <Button variant='secondary' onClick={setDemoStateAtBackend} className="m-2">
      {props.label}
    </Button>
  )
}


export default NextStateButton