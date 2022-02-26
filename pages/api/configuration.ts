import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from 'database'
import UserModel from 'database/user'
import { sendUpdateMessage } from 'services/update-message'

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
		if (req.method === 'POST') {
			await connectDB()
			
			const user = await UserModel.findOne({ id: req.query.userId })

		if (user) {
			user.kind = req.body.kind
			user.category = req.body.category
			user.keywords = req.body.keywords
			user.save()

			console.log(user.toJSON())
		} else {
			console.log('Create user')
			const newUser = await UserModel.create({
				id: req.query.userId,
				kind: req.body.kind,
				category: req.body.category,
				keywords: req.body.keywords,
				isGenerating: false,
			})

			await newUser.save()
			console.log(newUser.toJSON())
		}

		await sendUpdateMessage({
			userId: req.query.userId as string,
			text: 'Please input your idea:',
		})
		res.send('Please close this page and continue the conversation.')
	} else {
		res.status(404)
	} 
}
