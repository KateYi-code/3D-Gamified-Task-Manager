import path from "path"

import fs from "fs"

import forge from "node-forge"

const certDir = path.join(process.cwd(), 'certificates')
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir)
}

const keys = forge.pki.rsa.generateKeyPair(2048)

const cert = forge.pki.createCertificate()
cert.publicKey = keys.publicKey
cert.serialNumber = '01'
cert.validity.notBefore = new Date()
cert.validity.notAfter = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'NZ'
}, {
  shortName: 'ST',
  value: 'Auckland'
}, {
  name: 'localityName',
  value: 'Auckland'
}, {
  name: 'organizationName',
  value: 'Local Development'
}, {
  shortName: 'OU',
  value: 'Development'
}]

cert.setSubject(attrs)
cert.setIssuer(attrs)

cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 2,
    value: 'localhost'
  }, {
    type: 7,
    ip: '127.0.0.1'
  }]
}])

cert.sign(keys.privateKey)

const certPem = forge.pki.certificateToPem(cert)
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey)

fs.writeFileSync(path.join(certDir, 'cert.pem'), certPem)
fs.writeFileSync(path.join(certDir, 'key.pem'), privateKeyPem)

console.log('certificates done')