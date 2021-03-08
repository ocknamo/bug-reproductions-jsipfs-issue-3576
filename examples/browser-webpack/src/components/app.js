'use strict'

const React = require('react')
const IPFS = require('ipfs')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayToString = require('uint8arrays/to-string')
const fileContentToDataUri = require('./utils/convert')

const stringToUse = 'hello world from webpacked IPFS'

let node = null;

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      agentVersion: null,
      protocolVersion: null,
      addedFileHash: null,
      addedFileContents: null,
    }
  }

  componentDidMount () {
    this.ops()
  }

  async ops () {
    node = await IPFS.create({ repo: String(Math.random() + Date.now()) })

    console.log('IPFS node is ready')

    const { id, agentVersion, protocolVersion } = await node.id()

    this.setState({ id, agentVersion, protocolVersion })

    const { cid } = await node.add(stringToUse)
    this.setState({ addedFileHash: cid.toString() })

    let bufs = []

    for await (const buf of node.cat(cid)) {
      bufs.push(buf)
    }

    const data = uint8ArrayConcat(bufs)
    this.setState({ addedFileContents: uint8ArrayToString(data) })
  }

  async handleChangeFile(e) {
    const target = e.target;
    const file = target.files.item(0);
    console.log('LOG :>> ', file.name);


    // regular API
    // const { cid } = await node.add(file);

    // MFS API
    const path = `/${file.name}`;
    await node.files.write(path, file, { create: true });
    const { cid } = await node.files.stat(path);

    console.log('cid :>> ', String(cid));
    this.setState({ addedFileHash: cid.toString() });

    // Get file from IPFS
    const files = await node.get(cid, { timeout: 10000 });
    // Create dataUri
    let dataUri = ''
    for await (const file of files) {
      dataUri = await fileContentToDataUri(file.content);
    }

    // Downloag file
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = dataUri;
    a.download = 'test.jpg';
    a.click();
  }

  render () {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1>Everything is working!</h1>
        <p>Your ID is <strong>{this.state.id}</strong></p>
        <p>Your IPFS version is <strong>{this.state.agentVersion}</strong></p>
        <p>Your IPFS protocol version is <strong>{this.state.protocolVersion}</strong></p>
        <hr />
        <div>
          Added a file! <br />
          {this.state.addedFileHash}
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.addedFileContents}
        </p>
        <input id="file" type="file" onChange={(e) => this.handleChangeFile(e)}/>
      </div>
    )
  }
}
module.exports = App
