const sendMail = jest.fn().mockResolvedValue(true)

const createTransport = jest.fn(() => ({ sendMail }))

export default { createTransport }
export { createTransport, sendMail }