import { io } from 'socket.io-client'
import { getAuthToken } from './utils.js'
import { processMatchUpdate } from './process_ball.js'

class _MatchSocket {
  _socket

  constructor() {
    this._socket = io.connect('http://socket.sports.roanuz.com/cricket', { path: '/v5/websocket', reconnect: true })

    // server emits 'on_match_joined'
    this._socket.on('on_match_joined', function (data) {
      console.log('Cricket match joined!', data.key)
    })

    // the subscribed match content are emitted with 'on_match_update' event
    // since it's gzipped data, parse it to unzip it
    this._socket.on('on_match_update', function (res) {
      console.log('new match update received \n')
      processMatchUpdate(JSON.parse(res))
    })

    // emits 'on_error' on, match not subscribed
    this._socket.on('on_error', function (data) {
      console.error('not_subscribed', JSON.parse(data))
    })
  }

  async listen(matchKey) {
    this._socket.emit('connect_to_match', {
      token: await getAuthToken(),
      match_key: matchKey,
    })
  }
}

export const matchSocket = new _MatchSocket()
