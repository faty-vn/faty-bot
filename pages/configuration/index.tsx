import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router'
import axios from 'axios';
import styled from 'styled-components';
import {isMobile} from 'react-device-detect';
import i18n from 'i18n'

const Header = styled.h1`
  font-size: 48px
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

const ConfigurationForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
`

const FieldWrapper = styled.div`
  margin-bottom: 20px;
`

const SelectInput = styled.select`
  border: 1px solid #000000;
  width: 300px;
  height: 40px;
`

const Keywords = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const FieldLabel = styled.div`
  justify-self: center;
  text-align: start;
  width: 100%;
  margin-bottom: 10px;
`

const KeywordInput = styled.input`
  border: 1px solid #000000;
  width: 90%;
  margin-bottom: 10px;
  height: 30px;
`

const ButtonsWarpper = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const AddKeywordButton = styled.div`
  line-height: 40px;
  width: 150px;
  height: 40px;
  cursor: pointer;
  margin-bottom: 20px;
  color: rgb(33, 153, 33);
  border: 1px solid rgb(33, 153, 33);
  text-align: center;
`

const SubmitButton = styled.button`
  width: 90px;
  height: 40px;
  cursor: pointer;
  background: rgb(33, 153, 33);
  border: 1px solid rgb(33, 153, 33);
  color: #fff;
  font-weight: bold;
  border-radius: 2px;

  &:hover {
    background: rgb(255, 255, 255);
    color: rgb(33, 153, 33);
  }
`

const CATEGORIES = [
  { value: 'news', text: 'News' },
  { value: 'article', text: 'Article' },
  { value: 'paper', text: 'Paper' },
];

const KINDS = [
  { value: 'sports', text: 'Sports' },
  { value: 'technology', text: 'Technology' },
  { value: 'economy', text: 'Economy' },
];

const Configuration = () => {
  const router = useRouter()
  const { userId } = router.query
  // const userId = new URLSearchParams(search).get('userId');
  console.log(userId)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'news',
      kind: 'sports',
    },
  });
  const [keywords, setKeywords] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    console.log(data);
    try {
      // await axios.post(
      //   `http://localhost:3000/api/configuration?userId=${userId}`,
      //   {
      //     ...data,
      //     keywords: keywords.join(','),
      //   }
      // );
      
      if (isMobile) {
        router.push('/api/webhook/messenger/close_window')
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.log('error');
    }
  };

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const onKeywordChange = (position: any, value: any) => {
    const newKeywords: any[] = [...keywords];
    newKeywords[position] = value;
    setKeywords(newKeywords);
  };

  if (isSuccess) {
    return (
      <Wrapper>
        <div>{i18n.t('closeWindow')}</div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div>
        <Header>Configuration</Header>

        <ConfigurationForm onSubmit={handleSubmit(onSubmit)}>
          <FieldWrapper>
            <FieldLabel>Category</FieldLabel>
            <SelectInput
              {...register('category', { required: true })}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.text}
                </option>
              ))}
            </SelectInput>
            {errors.category && <span>Category required</span>}
          </FieldWrapper>

          <FieldWrapper>
            <FieldLabel>Kind</FieldLabel>
            <SelectInput
              {...register('kind', { required: true })}
            >
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.text}
                </option>
              ))}
            </SelectInput>
            {errors.kind && <span>Kind required</span>}
          </FieldWrapper>

          <Keywords>
            {!isEmpty(keywords) && (
              <FieldLabel>Keywords</FieldLabel>
            )}

            {keywords.map((keyword, i) => (
              <KeywordInput
                key={i}
                value={keyword}
                onChange={(e) => onKeywordChange(i, e.target.value)}
              />
            ))}
          </Keywords>

          <ButtonsWarpper>
            <AddKeywordButton onClick={addKeyword}>
              Add keyword
            </AddKeywordButton>

            <SubmitButton type="submit">
              Submit
            </SubmitButton>
          </ButtonsWarpper>
        </ConfigurationForm>
      </div>
    </Wrapper>
  );
};

export default Configuration;
