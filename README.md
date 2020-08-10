# ClasseViva API

[![GitHub license](https://img.shields.io/github/license/alex-sandri/classeviva-api)](https://github.com/alex-sandri/classeviva-api/blob/master/LICENSE)\
![GitHub package.json version](https://img.shields.io/github/package-json/v/alex-sandri/classeviva-api)

ClasseViva API is an **unofficial** module that allows you to access data from Spaggiari's ClasseViva electronic register.

## Table of Contents

 * [Installation](#installation)
 * [Usage](#usage)
 * [License](#license)

## Installation

Before installing, make sure to authenticate with GitHub Package Registry or using a `.npmrc` file. See "[Configuring npm for use with GitHub Package Registry](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry#authenticating-to-github-package-registry)".

```
npm config set @alex-sandri:registry https://npm.pkg.github.com/
npm install @alex-sandri/classeviva-api
```

## Usage

### Import

```typescript
import { ClasseViva } from "@alex-sandri/classeviva-api";
```

### Create a new session

```typescript
ClasseViva.createSession("uid", "pwd").then(session =>
{
    // Access the session data
});
```

### Get profile

```typescript
const profile = await session.getProfile();
```

### Get grades

```typescript
const grades = await session.getGrades();
```

### Get agenda

```typescript
const agenda = await session.getAgenda();
```

### Get attachments

```typescript
const attachments = await session.getAttachments();
```

### Get demerits

```typescript
const demerits = await session.getDemerits();
```

## License

This project is licensed under the terms of the MIT license.\
See the [LICENSE](LICENSE) file for details.
